<template>
  <div class="pagination">
    <button 
      @click="changePage(currentPage - 1)" 
      class="page-btn prev-btn" 
      :disabled="currentPage === 1"
      title="Page précédente"
    >
      &lsaquo;
    </button>
    
    <div class="page-numbers">
      <button 
        v-for="page in visiblePages" 
        :key="page" 
        @click="changePage(page)" 
        class="page-btn number-btn"
        :class="{ active: page === currentPage }"
      >
        {{ page }}
      </button>
    </div>
    
    <button 
      @click="changePage(currentPage + 1)" 
      class="page-btn next-btn" 
      :disabled="currentPage === totalPages"
      title="Page suivante"
    >
      &rsaquo;
    </button>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    }
  },
  computed: {
    // Calcule les numéros de page à afficher
    visiblePages() {
      const maxVisiblePages = 5;
      let pages = [];
      
      // Si le nombre total de pages est inférieur ou égal au nombre maximum de pages visibles
      if (this.totalPages <= maxVisiblePages) {
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Calcule les pages visibles en fonction de la page courante
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = startPage + maxVisiblePages - 1;
        
        // Ajuste les pages de début et de fin si nécessaire
        if (endPage > this.totalPages) {
          endPage = this.totalPages;
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    }
  },
  methods: {
    changePage(page) {
      if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
        this.$emit('page-change', page);
      }
    }
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;
}

.page-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
  padding: 0.5rem 0.8rem;
  margin: 0 0.2rem;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 4px;
}

.page-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.page-btn.active {
  background-color: #e50914;
  color: white;
  border-color: #e50914;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  margin: 0 0.5rem;
}

@media (max-width: 576px) {
  .page-btn {
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
  }
}
</style>