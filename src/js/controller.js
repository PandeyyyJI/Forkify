import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    //1. Loading recipe
    await model.loadRecipe(id);

    //2. Rendering Recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render Results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (gotoPage) {
  // 1) Render new Results
  resultsView.render(model.getSearchResultsPage(gotoPage));

  // 2) Render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //  1) Add/Remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //  2)Update Recipe View
  recipeView.update(model.state.recipe);

  // 3) Render Bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //  Show loading spinner
    addRecipeView.renderSpinner();

    //  Upload the new Recipe Data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render Recipe
    recipeView.render(model.state.recipe);

    //  Success message
    addRecipeView.renderMessage();

    // Render Bookmark
    bookmarksView.render(model.state.bookmarks);

    //  Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //  Close form
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.log(err);
    addRecipeView.renderError(err.message);
  }
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const newFeature = function () {
  console.log('Welcome to the Application');
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();
