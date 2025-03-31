import { useState } from "react";
import categoriesData from "../Data/CategoriesData"; // Import categories data
import "../Stylings/Categories.css"; // Your styling file

const Categories = () => {
  const [search, setSearch] = useState("");

  // Filter categories based on search input
  const filteredCategories = categoriesData.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="categories-container" id="categories">
      <h2 className="title">Shop by Category</h2>
      
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search categories..."
        className="search-bar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Categories Grid */}
      <div className="categories-grid">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div className="category-card" key={category.id}>
              <img src={category.image} alt={category.name} className="category-img" />
              <h3 className="category-title">{category.name}</h3>
            </div>
          ))

        ) : (
          <p className="no-results">No categories found.</p>
        )}
        
      </div>
      
    </div>
  );
};

export default Categories;
