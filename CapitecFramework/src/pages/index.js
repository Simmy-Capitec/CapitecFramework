// The index.js file works as a central hub for importing/exporting page objects
// This makes it easier to import multiple page objects in our tests
import SimpleHomePage from "./demo/SimpleHomePage";
import SimpleProductPage from "./demo/simpleProductPage";
import SimpleCartPage from "./demo/simpleCartPage";
import TakealotProductPage from "./TakealotProductPage";

// This export statement makes all these classes available to other files
// When another file imports from this index, it can access any of these
export {
    SimpleHomePage,
    SimpleProductPage,
    SimpleCartPage,
    TakealotProductPage
};
