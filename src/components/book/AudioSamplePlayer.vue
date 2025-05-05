<template>
  <div class="audio-player">
    <div class="audio-player__info">
      <h3 class="audio-player__title">{{ title }}</h3>
      <p class="audio-player__duration">
        <UiIcon name="clock" size="sm" class="audio-player__icon" />
        {{ formattedCurrentTime }} / {{ formattedDuration }}
      </p>
    </div>
    
    <div class="audio-player__controls">
      <button 
        class="audio-player__button audio-player__button--main" 
        @click="togglePlay"
        :aria-label="isPlaying ? 'Пауза' : 'Воспроизвести'"
      >
        <UiIcon :name="isPlaying ? 'pause' : 'play'" size="md" />
      </button>
      
      <button 
        class="audio-player__button" 
        @click="seek(-10)"
        aria-label="Назад 10 секунд"
      >
        <UiIcon name="backward" size="sm" />
        <span class="audio-player__button-text">10s</span>
      </button>
      
      <button 
        class="audio-player__button" 
        @click="seek(10)"
        aria-label="Вперед 10 секунд"
      >
        <UiIcon name="forward" size="sm" />
        <span class="audio-player__button-text">10s</span>
      </button>
      
      <div class="audio-player__volume">
        <button 
          class="audio-player__button audio-player__button--volume" 
          @click="toggleMute"
          :aria-label="isMuted ? 'Включить звук' : 'Выключить звук'"
        >
          <UiIcon :name="isMuted ? 'speaker-x-mark' : 'speaker-wave'" size="sm" />
        </button>
        
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          v-model="volume" 
          class="audio-player__volume-slider"
          aria-label="Громкость"
        />
      </div>
    </div>
    
    <div class="audio-player__progress">
      <div class="audio-player__progress-container" @click="onProgressClick">
        <div class="audio-player__progress-bar" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>
    
    <!-- Если используется реальный аудиофайл -->
    <audio 
      ref="audioElement" 
      :src="audioUrl" 
      @timeupdate="onTimeUpdate" 
      @loadedmetadata="onMetadataLoaded" 
      @ended="onAudioEnded"
      @error="onAudioError"
      preload="metadata"
    ></audio>
    
    <!-- Показываем только если используется Web Speech API -->
    <div v-if="useSpeechSynthesis" class="audio-player__speech-status">
      {{ speechStatus }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { UiIcon } from '../ui';

const props = defineProps<{
  audioUrl?: string;
  title: string;
  duration?: number;
  useSpeechSynthesis?: boolean;
  textToRead?: string;
}>();

const emit = defineEmits<{
  (e: 'ended'): void;
  (e: 'error', error: Error): void;
  (e: 'playing', isPlaying: boolean): void;
}>();

// Refs
const audioElement = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const isMuted = ref(false);
const volume = ref(0.7);
const currentTime = ref(0);
const audioDuration = ref(0);
const speechStatus = ref('');
const speechUtterance = ref<SpeechSynthesisUtterance | null>(null);

// Computed values
const progressPercent = computed(() => {
  if (audioDuration.value <= 0) return 0;
  return (currentTime.value / audioDuration.value) * 100;
});

const formattedCurrentTime = computed(() => formatTime(currentTime.value));
const formattedDuration = computed(() => formatTime(audioDuration.value));

// Watch для изменения громкости
watch(volume, (newVolume) => {
  if (audioElement.value) {
    audioElement.value.volume = newVolume;
  }
});

// Функции для управления аудио
function togglePlay() {
  if (props.useSpeechSynthesis) {
    toggleSpeech();
    return;
  }
  
  if (!audioElement.value) return;
  
  if (isPlaying.value) {
    audioElement.value.pause();
  } else {
    audioElement.value.play().catch(handleError);
  }
  
  isPlaying.value = !isPlaying.value;
  emit('playing', isPlaying.value);
}

function toggleMute() {
  if (!audioElement.value) return;
  
  isMuted.value = !isMuted.value;
  
  if (props.useSpeechSynthesis) {
    if (isMuted.value) {
      window.speechSynthesis.pause();
    } else {
      window.speechSynthesis.resume();
    }
    return;
  }
  
  audioElement.value.muted = isMuted.value;
}

function seek(seconds: number) {
  if (props.useSpeechSynthesis) {
    // Speech API не поддерживает перемотку
    return;
  }
  
  if (!audioElement.value) return;
  
  const newTime = audioElement.value.currentTime + seconds;
  audioElement.value.currentTime = Math.max(0, Math.min(newTime, audioElement.value.duration));
}

function onProgressClick(event: MouseEvent) {
  if (props.useSpeechSynthesis) return;
  if (!audioElement.value) return;
  
  const progressBar = event.currentTarget as HTMLElement;
  const rect = progressBar.getBoundingClientRect();
  const clickPosition = (event.clientX - rect.left) / rect.width;
  
  audioElement.value.currentTime = clickPosition * audioElement.value.duration;
}

// Event handlers для аудио
function onTimeUpdate() {
  if (!audioElement.value) return;
  currentTime.value = audioElement.value.currentTime;
}

function onMetadataLoaded() {
  if (!audioElement.value) return;
  audioDuration.value = audioElement.value.duration;
  
  // Установим начальную громкость
  audioElement.value.volume = volume.value;
}

function onAudioEnded() {
  isPlaying.value = false;
  currentTime.value = 0;
  emit('ended');
}

function onAudioError(event: Event) {
  const error = new Error('Ошибка воспроизведения аудио');
  console.error('Ошибка аудио:', event);
  handleError(error);
}

function handleError(error: Error) {
  console.error('Ошибка воспроизведения:', error);
  isPlaying.value = false;
  emit('error', error);
  
  // Если есть текст для чтения, переключимся на Web Speech API
  if (props.textToRead && !props.useSpeechSynthesis) {
    setupSpeechSynthesis();
  }
}

// Функции для Web Speech API
function setupSpeechSynthesis() {
  if (!window.speechSynthesis || !props.textToRead) return;
  
  speechUtterance.value = new SpeechSynthesisUtterance(props.textToRead);
  
  // Попробуем найти русский голос
  const voices = window.speechSynthesis.getVoices();
  const russianVoice = voices.find(voice => voice.lang.includes('ru'));
  
  if (russianVoice) {
    speechUtterance.value.voice = russianVoice;
    speechUtterance.value.lang = 'ru-RU';
  }
  
  speechUtterance.value.rate = 0.9;
  speechUtterance.value.pitch = 1;
  
  speechUtterance.value.onstart = () => {
    isPlaying.value = true;
    speechStatus.value = 'Воспроизведение...';
    emit('playing', true);
  };
  
  speechUtterance.value.onpause = () => {
    isPlaying.value = false;
    speechStatus.value = 'Пауза';
    emit('playing', false);
  };
  
  speechUtterance.value.onresume = () => {
    isPlaying.value = true;
    speechStatus.value = 'Воспроизведение...';
    emit('playing', true);
  };
  
  speechUtterance.value.onend = () => {
    isPlaying.value = false;
    speechStatus.value = '';
    emit('ended');
    emit('playing', false);
  };
  
  speechUtterance.value.onerror = (event) => {
    isPlaying.value = false;
    speechStatus.value = 'Ошибка';
    emit('error', new Error(event.error || 'Ошибка синтеза речи'));
    emit('playing', false);
  };
  
  // Установим начальную длительность для progressBar
  audioDuration.value = props.duration || 60; // Примерная длительность в секундах
  
  // Запуск прогресса при использовании Speech API
  startSpeechProgress();
}

function toggleSpeech() {
  if (!window.speechSynthesis) return;
  
  if (isPlaying.value) {
    window.speechSynthesis.pause();
    isPlaying.value = false;
    speechStatus.value = 'Пауза';
    emit('playing', false);
  } else {
    if (currentTime.value > 0) {
      window.speechSynthesis.resume();
    } else if (speechUtterance.value) {
      window.speechSynthesis.speak(speechUtterance.value);
    }
    isPlaying.value = true;
    speechStatus.value = 'Воспроизведение...';
    emit('playing', true);
    
    // Запуск прогресса при использовании Speech API
    startSpeechProgress();
  }
}

let progressInterval: number | null = null;

function startSpeechProgress() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  
  progressInterval = window.setInterval(() => {
    if (isPlaying.value) {
      currentTime.value = Math.min(currentTime.value + 0.1, audioDuration.value);
      
      if (currentTime.value >= audioDuration.value) {
        clearInterval(progressInterval!);
        progressInterval = null;
        isPlaying.value = false;
        emit('ended');
        emit('playing', false);
      }
    }
  }, 100);
}

// Вспомогательные функции
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Lifecycle hooks
onMounted(() => {
  if (props.useSpeechSynthesis) {
    setupSpeechSynthesis();
  } else if (props.duration && (!props.audioUrl || !audioElement.value)) {
    audioDuration.value = props.duration;
  }
  
  // Обработка голосов (они загружаются асинхронно)
  if (window.speechSynthesis) {
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = setupSpeechSynthesis;
    }
  }
});

onBeforeUnmount(() => {
  // Остановка аудио при уничтожении компонента
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.currentTime = 0;
  }
  
  // Очистка Speech API
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  
  // Очистка интервала прогресса
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
});
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;

.audio-player {
  @include flex(column, flex-start, stretch);
  gap: $spacing-md;
  width: 100%;
  padding: $spacing-md;
  background-color: var(--color-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  
  &__info {
    @include flex(row, space-between, center);
    gap: $spacing-sm;
    
    @include respond-to(xs) {
      flex-direction: column;
      align-items: flex-start;
    }
  }
  
  &__title {
    font-size: $font-size-md;
    font-weight: 600;
    margin: 0;
  }
  
  &__duration {
    @include flex(row, flex-start, center);
    gap: $spacing-xs;
    font-size: $font-size-sm;
    color: var(--color-text-light);
  }
  
  &__icon {
    color: var(--color-primary);
  }
  
  &__controls {
    @include flex(row, flex-start, center);
    gap: $spacing-md;
    flex-wrap: wrap;
  }
  
  &__button {
    @include flex(row, center, center);
    background-color: transparent;
    border: 1px solid var(--color-border);
    border-radius: $border-radius-full;
    width: 40px;
    height: 40px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: var(--color-surface-hover);
    }
    
    &:active {
      transform: scale(0.95);
    }
    
    &--main {
      background-color: var(--color-primary);
      color: white;
      width: 50px;
      height: 50px;
      
      &:hover {
        background-color: var(--color-primary-dark);
      }
    }
    
    &--volume {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
  
  &__button-text {
    font-size: $font-size-xs;
    margin-left: 2px;
  }
  
  &__volume {
    @include flex(row, flex-start, center);
    min-width: 120px;
  }
  
  &__volume-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 40px;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-left: none;
    border-top-right-radius: $border-radius-md;
    border-bottom-right-radius: $border-radius-md;
    outline: none;
    padding: 0 $spacing-sm;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: var(--color-primary);
      cursor: pointer;
    }
    
    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: var(--color-primary);
      cursor: pointer;
      border: none;
    }
  }
  
  &__progress {
    width: 100%;
  }
  
  &__progress-container {
    width: 100%;
    height: 8px;
    background-color: var(--color-surface);
    border-radius: 4px;
    cursor: pointer;
    overflow: hidden;
  }
  
  &__progress-bar {
    height: 100%;
    background-color: var(--color-primary);
    border-radius: 4px;
    transition: width 0.1s linear;
  }
  
  &__speech-status {
    font-size: $font-size-sm;
    color: var(--color-text-light);
    margin-top: $spacing-xs;
    font-style: italic;
  }
}
</style> 