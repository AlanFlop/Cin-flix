<template>
  <div class="movie-view">
    <MovieDetails />
  </div>
</template>

<script>
import MovieDetails from '@/components/MovieDetails.vue'

export default {
  name: 'MovieView',
  components: {
    MovieDetails
  }
}
</script>

<style scoped>
.movie-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 2rem;
}
</style>