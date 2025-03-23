import { createStore } from 'vuex'
import auth from './modules/auth'
import movies from './modules/movies'
import cart from './modules/cart'

// Ajoutez une méthode pour vérifier si un module est enregistré
const store = createStore({
  modules: {
    auth,
    movies,
    cart
  }
})

store.hasModule = function(moduleName) {
  return this._modules.root._children[moduleName] !== undefined;
};

export default store;