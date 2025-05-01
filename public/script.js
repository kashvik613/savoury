document.addEventListener("DOMContentLoaded", () => {
    const searchBox = document.querySelector('.searchBox');
    const searchBtn = document.querySelector('.searchBtn');
    const recipeContainer = document.querySelector('.recipe-container');
    const recipeDetails = document.querySelector('.recipe-details');
    const recipeDetailsContent = document.querySelector('.recipe-details-content');
    const recipeCloseBtn = document.querySelector('.recipe-close-btn');
    const recommendedSection = document.querySelector('.recommended-section');
    const recommendedContainer = document.querySelector('.recommended-container');
    const weeklyRecipeContainer = document.getElementById("weekly-recipe");
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;
    const searchForm = document.querySelector('.search-form');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const featuredContainer = document.querySelector('.featured-container');
    const categoryCards = document.querySelectorAll('.category-card');

    // ✅ Load saved theme from localStorage
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
    }

    // Initialize GSAP for smooth animations
    gsap.registerPlugin(ScrollTrigger);

    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark" : "light");
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            gsap.to('body', { backgroundColor: '#1a1a1a', duration: 0.5 });
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            gsap.to('body', { backgroundColor: '#F7F9FC', duration: 0.5 });
        }
    });

    // ✅ Fetch Recommended Dishes
    const fetchRecommendedDishes = async () => {
        try {
            const response = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood");
            const data = await response.json();
            recommendedContainer.innerHTML = "";

            data.meals.slice(0, 6).forEach(meal => {
                const dishDiv = document.createElement("div");
                dishDiv.classList.add("recipe");
                dishDiv.innerHTML = `
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                    <h3>${meal.strMeal}</h3>
                    <button class="view-recipe-btn" data-id="${meal.idMeal}">View Recipe</button>
                `;

                recommendedContainer.appendChild(dishDiv);
            });
        } catch (error) {
            console.error("Error fetching recommended dishes:", error);
            recommendedContainer.innerHTML = "<p>Failed to load recommended dishes. Try again later.</p>";
        }
    };

    // ✅ Event Delegation for "View Recipe" Buttons
    document.body.addEventListener("click", (event) => {
        if (event.target.classList.contains("view-recipe-btn")) {
            const mealID = event.target.getAttribute("data-id");
            if (mealID) {
                fetchRecipeDetails(mealID);
            }
        }
    });

    // ✅ Fetch Recipe Details
    const fetchRecipeDetails = async (mealID) => {
        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`);
            const data = await response.json();

            if (data.meals) {
                openRecipePopup(data.meals[0]);
            }
        } catch (error) {
            console.error("Error fetching recipe details:", error);
        }
    };

    // ✅ Open Recipe Details Popup
    const openRecipePopup = (meal) => {
        document.body.classList.add("no-scroll");

        recipeDetailsContent.innerHTML = `
            <h2 class="recipeName">${meal.strMeal}</h2>
            <h3>Ingredients:</h3>
            <ul class="ingredientList">${fetchIngredients(meal)}</ul>
            <div class="recipeinstructions"> 
                <h3>Instructions:</h3>
                <p>${meal.strInstructions}</p>
            </div>
        `;

        recipeDetails.style.display = "block";
    };

    // ✅ Close Recipe Popup
    if (recipeCloseBtn) {
        recipeCloseBtn.addEventListener('click', () => {
            document.body.classList.remove("no-scroll");
            recipeDetails.style.display = "none";
        });
    }

    // ✅ Extract Ingredients from Meal Object (Optimized)
    const fetchIngredients = (meal) => {
        return Array.from({ length: 20 }, (_, i) => i + 1)
            .map(i => {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                return ingredient ? `<li>${measure} ${ingredient}</li>` : "";
            })
            .filter(item => item)
            .join("");
    };

    // ✅ Search Recipes
    const searchRecipes = async (query) => {
        recommendedSection.classList.add("hidden");
        recipeContainer.innerHTML = "<h2>Searching...</h2>";

        try {
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
            const data = await response.json();

            recipeContainer.innerHTML = "";

            if (!data.meals) {
                recipeContainer.innerHTML = "<h2>No Recipes Found</h2>";
                return;
            }

            data.meals.forEach(meal => {
                const recipeDiv = document.createElement("div");
                recipeDiv.classList.add("recipe");
                recipeDiv.innerHTML = `
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                    <h3>${meal.strMeal}</h3>
                    <p><span>${meal.strArea}</span> Dish</p>
                    <p>Belongs to the <span>${meal.strCategory}</span> Category</p>
                    <button class="view-recipe-btn" data-id="${meal.idMeal}">View Recipe</button>
                `;

                recipeContainer.appendChild(recipeDiv);
            });
        } catch (error) {
            console.error("Error fetching recipes:", error);
            recipeContainer.innerHTML = "<h2>Error Fetching Recipes. Try Again.</h2>";
        }
    };

    // ✅ Handle Search Button Click
    searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const searchInput = searchBox.value.trim();
        if (searchInput === "") {
            recipeContainer.innerHTML = "<h2>Please enter a search term</h2>";
        } else {
            searchRecipes(searchInput);
        }
    });

    // ✅ Fetch & Cache Recipe of the Week
    const fetchWeeklyRecipe = async () => {
        try {
            const response = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
            const data = await response.json();

            if (data.meals) {
                const recipe = data.meals[0];
                const weeklyRecipeData = {
                    id: recipe.idMeal,
                    name: recipe.strMeal,
                    image: recipe.strMealThumb,
                    timestamp: Date.now()
                };

                localStorage.setItem("weeklyRecipe", JSON.stringify(weeklyRecipeData));
                displayWeeklyRecipe(weeklyRecipeData);
            }
        } catch (error) {
            console.error("Error fetching weekly recipe:", error);
            weeklyRecipeContainer.innerHTML = "<p>Failed to load recipe. Try again later.</p>";
        }
    };

    const displayWeeklyRecipe = (recipe) => {
        weeklyRecipeContainer.innerHTML = `
            <div class="recipe-card">
                <img src="${recipe.image}" alt="${recipe.name}">
                <h3>${recipe.name}</h3>
            </div>
        `;
    };

    const checkWeeklyRecipe = () => {
        const savedRecipe = JSON.parse(localStorage.getItem("weeklyRecipe"));
        if (savedRecipe && Date.now() - savedRecipe.timestamp < 7 * 24 * 60 * 60 * 1000) {
            displayWeeklyRecipe(savedRecipe);
        } else {
            fetchWeeklyRecipe();
        }
    };

    // ✅ Filter Buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Add filter functionality here
        });
    });

    // ✅ Fetch Featured Recipes
    const fetchFeaturedRecipes = async () => {
        try {
            const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
            const data = await response.json();
            return data.meals;
        } catch (error) {
            console.error('Error fetching featured recipes:', error);
            return null;
        }
    };

    // ✅ Display Featured Recipes
    const displayFeaturedRecipes = async () => {
        const recipes = await Promise.all([
            fetchFeaturedRecipes(),
            fetchFeaturedRecipes(),
            fetchFeaturedRecipes()
        ]);
        
        featuredContainer.innerHTML = '';
        recipes.forEach((recipe, index) => {
            if (recipe) {
                const recipeCard = document.createElement('div');
                recipeCard.classList.add('recipe');
                recipeCard.innerHTML = `
                    <img src="${recipe[0].strMealThumb}" alt="${recipe[0].strMeal}">
                    <h3>${recipe[0].strMeal}</h3>
                    <button class="view-recipe-btn" onclick="showRecipeDetails('${recipe[0].idMeal}')">
                        View Recipe
                    </button>
                `;
                featuredContainer.appendChild(recipeCard);

                // Animate featured recipes
                gsap.from(recipeCard, {
                    scrollTrigger: {
                        trigger: recipeCard,
                        start: 'top bottom',
                        toggleActions: 'play none none reverse'
                    },
                    y: 50,
                    opacity: 0,
                    duration: 0.8,
                    delay: index * 0.2
                });
            }
        });
    };

    // ✅ Load Initial Data
    fetchRecommendedDishes();
    checkWeeklyRecipe();
    displayFeaturedRecipes();

    // Add scroll animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.category-card, .recipe').forEach(el => {
        observer.observe(el);
    });

    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Category Card Animations
    categoryCards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                toggleActions: 'play none none reverse'
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: index * 0.2
        });
    });

    // Search Form Animation
    gsap.from('.search-container', {
        y: -20,
        opacity: 0,
        duration: 1,
        delay: 0.5
    });

    // Hero Section Animations
    gsap.from('.hero-content', {
        x: -100,
        opacity: 0,
        duration: 1,
        delay: 0.3
    });

    gsap.from('.hero-image', {
        x: 100,
        opacity: 0,
        duration: 1,
        delay: 0.3
    });

    // Fetch Recipes with Loading Animation
    async function fetchRecipes(query) {
        try {
            // Show loading animation
            recipeContainer.innerHTML = `
                <div class="loading-animation">
                    <div class="spinner"></div>
                    <p>Searching for recipes...</p>
                </div>
            `;

            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
            const data = await response.json();
            return data.meals;
        } catch (error) {
            console.error('Error fetching recipes:', error);
            return null;
        }
    }

    // Display Recipes with Animation
    function displayRecipes(recipes) {
        recipeContainer.innerHTML = '';
        if (recipes) {
            recipes.forEach((recipe, index) => {
                const recipeCard = document.createElement('div');
                recipeCard.classList.add('recipe');
                recipeCard.innerHTML = `
                    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                    <h3>${recipe.strMeal}</h3>
                    <button class="view-recipe-btn" onclick="showRecipeDetails('${recipe.idMeal}')">
                        View Recipe
                    </button>
                `;
                recipeContainer.appendChild(recipeCard);

                // Animate each recipe card
                gsap.from(recipeCard, {
                    scrollTrigger: {
                        trigger: recipeCard,
                        start: 'top bottom',
                        toggleActions: 'play none none reverse'
                    },
                    y: 50,
                    opacity: 0,
                    duration: 0.8,
                    delay: index * 0.1
                });
            });
        } else {
            recipeContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No recipes found. Try a different search term.</p>
                </div>
            `;
        }
    }

    // Show Recipe Details with Animation
    async function showRecipeDetails(id) {
        try {
            // Show loading animation
            recipeDetailsContent.innerHTML = `
                <div class="loading-animation">
                    <div class="spinner"></div>
                    <p>Loading recipe details...</p>
                </div>
            `;
            recipeDetails.classList.add('active');
            document.body.classList.add('no-scroll');

            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
            const data = await response.json();
            const recipe = data.meals[0];
            
            let ingredients = '';
            for (let i = 1; i <= 20; i++) {
                if (recipe[`strIngredient${i}`]) {
                    ingredients += `<li>${recipe[`strIngredient${i}`]} - ${recipe[`strMeasure${i}`]}</li>`;
                }
            }

            recipeDetailsContent.innerHTML = `
                <h2>${recipe.strMeal}</h2>
                <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                <div class="recipe-info">
                    <h3>Ingredients:</h3>
                    <ul>${ingredients}</ul>
                    <h3>Instructions:</h3>
                    <p>${recipe.strInstructions}</p>
                </div>
            `;

            // Animate recipe details content
            gsap.from('.recipe-details-content > *', {
                y: 30,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1
            });
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            recipeDetailsContent.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading recipe details. Please try again.</p>
                </div>
            `;
        }
    }

    // Close Recipe Details with Animation
    recipeCloseBtn.addEventListener('click', () => {
        gsap.to(recipeDetails, {
            scale: 0.9,
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                recipeDetails.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    });

    // Search Form Submission
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const searchTerm = searchBox.value.trim();
        if (searchTerm) {
            const recipes = await fetchRecipes(searchTerm);
            displayRecipes(recipes);
        }
    });

    // Testimonials Data
    const testimonials = [
        {
            quote: "This recipe app has completely transformed my cooking experience! The recipes are easy to follow and the results are always delicious.",
            author: "Kashvi Kalra",
            role: "Home Chef",
            image: "https://via.placeholder.com/150/FFB6C1/FFFFFF?text=K"
        },
        {
            quote: "I love how organized and user-friendly this app is. The search functionality makes it so easy to find exactly what I'm looking for.",
            author: "Kirti Sharna",
            role: "Food Blogger",
            image: "https://via.placeholder.com/150/98FB98/FFFFFF?text=K"
        },
        {
            quote: "The recipe details are so comprehensive and the step-by-step instructions are perfect for beginners like me. Highly recommended!",
            author: "Kaviraj",
            role: "Cooking Enthusiast",
            image: "https://via.placeholder.com/150/87CEEB/FFFFFF?text=K"
        }
    ];

    // Display Testimonials
    function displayTestimonials() {
        const testimonialsContainer = document.querySelector('.testimonials-container');
        if (!testimonialsContainer) return;

        testimonialsContainer.innerHTML = testimonials.map(testimonial => `
            <div class="testimonial-card">
                <div class="testimonial-content">
                    <i class="fas fa-quote-left"></i>
                    <p>${testimonial.quote}</p>
                    <div class="testimonial-author">
                        <img src="${testimonial.image}" alt="${testimonial.author}">
                        <div>
                            <h4>${testimonial.author}</h4>
                            <p>${testimonial.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add animation to testimonial cards
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        testimonialCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    // Scroll to Top Button
    function initScrollToTop() {
        const scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.className = 'scroll-to-top';
        scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(scrollToTopBtn);

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Recipe Data with Categories
    const recipes = [
        // Indian Recipes
        {
            id: 1,
            title: "Butter Chicken",
            category: "Indian",
            image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&h=600&fit=crop",
            ingredients: [
                "500g chicken",
                "2 tbsp butter",
                "1 cup tomato puree",
                "1 cup cream",
                "2 tbsp ginger-garlic paste",
                "1 tsp garam masala",
                "1 tsp turmeric",
                "1 tsp chili powder",
                "Salt to taste"
            ],
            steps: [
                "Marinate chicken with yogurt, ginger-garlic paste, and spices for 2 hours",
                "Grill or pan-fry the chicken until cooked",
                "In a pan, melt butter and add tomato puree",
                "Add cream and spices, simmer for 10 minutes",
                "Add cooked chicken and simmer for 5 more minutes",
                "Garnish with fresh cream and coriander leaves"
            ],
            prepTime: "20 mins",
            cookTime: "30 mins",
            servings: 4,
            difficulty: "Medium"
        },
        // Italian Recipes
        {
            id: 2,
            title: "Spaghetti Carbonara",
            category: "Italian",
            image: "https://images.unsplash.com/photo-1588013273468-315fd88ea34c?w=800&h=600&fit=crop",
            ingredients: [
                "400g spaghetti",
                "200g pancetta or guanciale",
                "4 large eggs",
                "50g pecorino cheese",
                "50g parmesan",
                "Freshly ground black pepper",
                "Salt"
            ],
            steps: [
                "Cook pasta in boiling salted water",
                "Fry pancetta until crispy",
                "Whisk eggs with grated cheese",
                "Drain pasta, mix with pancetta",
                "Add egg mixture and stir quickly",
                "Season with black pepper"
            ],
            prepTime: "10 mins",
            cookTime: "15 mins",
            servings: 4,
            difficulty: "Medium"
        },
        // Asian Recipes
        {
            id: 3,
            title: "Pad Thai",
            category: "Asian",
            image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=800&h=600&fit=crop",
            ingredients: [
                "200g rice noodles",
                "2 eggs",
                "150g tofu",
                "2 tbsp tamarind paste",
                "2 tbsp fish sauce",
                "1 tbsp sugar",
                "Bean sprouts",
                "Spring onions",
                "Peanuts"
            ],
            steps: [
                "Soak noodles in warm water",
                "Prepare sauce with tamarind, fish sauce, and sugar",
                "Stir-fry tofu and eggs",
                "Add noodles and sauce",
                "Garnish with bean sprouts and peanuts"
            ],
            prepTime: "15 mins",
            cookTime: "10 mins",
            servings: 2,
            difficulty: "Medium"
        },
        // American Recipes
        {
            id: 4,
            title: "Classic Burger",
            category: "American",
            title: "Biryani",
            category: "Indian",
            image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&h=600&fit=crop",
            ingredients: [
                "2 cups basmati rice",
                "500g chicken/mutton",
                "2 onions, sliced",
                "2 tomatoes, chopped",
                "1 cup yogurt",
                "2 tbsp biryani masala",
                "Fresh mint and coriander leaves",
                "Saffron strands",
                "Ghee"
            ],
            steps: [
                "Soak rice for 30 minutes",
                "Marinate meat with yogurt and spices",
                "Cook rice until 70% done",
                "Layer rice and meat in a heavy-bottomed pot",
                "Add saffron milk and fried onions",
                "Seal with dough and cook on low heat for 30 minutes"
            ],
            prepTime: "30 mins",
            cookTime: "45 mins",
            servings: 6,
            difficulty: "Hard"
        },
        {
            id: 3,
            title: "Masala Dosa",
            category: "Indian",
            image: "https://images.unsplash.com/photo-1631515242808-497c3f8fefad?w=800&h=600&fit=crop",
            ingredients: [
                "2 cups rice",
                "1 cup urad dal",
                "Potatoes for filling",
                "Onions, chopped",
                "Mustard seeds",
                "Curry leaves",
                "Turmeric powder",
                "Salt to taste"
            ],
            steps: [
                "Soak rice and dal overnight",
                "Grind to make smooth batter",
                "Ferment batter for 8-10 hours",
                "Prepare potato filling with spices",
                "Spread batter on hot tawa",
                "Add filling and fold dosa"
            ],
            prepTime: "12 hours",
            cookTime: "20 mins",
            servings: 4,
            difficulty: "Medium"
        }
    ];

    // Function to display recipe details
    function displayRecipeDetails(recipeId) {
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const recipeDetails = document.querySelector('.recipe-details');
        const recipeContent = document.querySelector('.recipe-details-content');
        
        // Update recipe header
        const header = recipeContent.querySelector('.recipe-header');
        header.querySelector('img').src = recipe.image;
        header.querySelector('img').alt = recipe.title;
        header.querySelector('h2').textContent = recipe.title;
        
        // Update recipe meta
        const meta = header.querySelector('.recipe-meta');
        meta.querySelector('span:nth-child(1)').textContent = `Prep: ${recipe.prepTime}`;
        meta.querySelector('span:nth-child(2)').textContent = `Cook: ${recipe.cookTime}`;
        meta.querySelector('span:nth-child(3)').textContent = `Serves: ${recipe.servings}`;
        meta.querySelector('span:nth-child(4)').textContent = recipe.difficulty;
        
        // Update ingredients
        const ingredientsList = recipeContent.querySelector('.ingredients ul');
        ingredientsList.innerHTML = recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('');
        
        // Update steps
        const stepsList = recipeContent.querySelector('.steps ol');
        stepsList.innerHTML = recipe.steps.map(step => `<li>${step}</li>`).join('');
        
        // Show the popup
        recipeDetails.classList.add('show');
        document.body.classList.add('no-scroll');
    }

    // Function to close recipe details
    function closeRecipeDetails() {
        const recipeDetails = document.querySelector('.recipe-details');
        recipeDetails.classList.remove('show');
        document.body.classList.remove('no-scroll');
    }

    // Function to display recipes by category
    function displayRecipesByCategory(category) {
        const recipeContainer = document.querySelector('.recipe-container');
        const filteredRecipes = category === 'all' ? recipes : recipes.filter(recipe => recipe.category.toLowerCase() === category);
        
        recipeContainer.innerHTML = `
            <h2>${category === 'all' ? 'All Recipes' : category} Recipes</h2>
            <div class="filters">
                <button class="filter-btn ${category === 'all' ? 'active' : ''}" data-category="all">All</button>
                ${[...new Set(recipes.map(r => r.category))].map(cat => `
                    <button class="filter-btn ${category === cat.toLowerCase() ? 'active' : ''}" 
                            data-category="${cat.toLowerCase()}">${cat}</button>
                `).join('')}
            </div>
            <div class="recipes-grid">
                ${filteredRecipes.map(recipe => `
                    <div class="recipe-card" onclick="displayRecipeDetails(${recipe.id})">
                        <img src="${recipe.image}" alt="${recipe.title}">
                        <h3>${recipe.title}</h3>
                        <div class="recipe-meta">
                            <span><i class="fas fa-clock"></i> ${recipe.prepTime}</span>
                            <span><i class="fas fa-fire"></i> ${recipe.cookTime}</span>
                            <span><i class="fas fa-signal"></i> ${recipe.difficulty}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add event listeners to filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                displayRecipesByCategory(category);
            });
        });
    }

    // Function to handle category card clicks
    function initCategoryCards() {
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                displayRecipesByCategory(category);
                // Scroll to recipes section
                document.querySelector('.recipe-container').scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    // Function to handle search
    function handleSearch(event) {
        event.preventDefault();
        const searchTerm = document.querySelector('.searchBox').value.toLowerCase();
        const filteredRecipes = recipes.filter(recipe => 
            recipe.title.toLowerCase().includes(searchTerm) ||
            recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm))
        );
        
        const recipeContainer = document.querySelector('.recipe-container');
        recipeContainer.innerHTML = `
            <h2>Search Results for "${searchTerm}"</h2>
            <div class="recipes-grid">
                ${filteredRecipes.map(recipe => `
                    <div class="recipe-card" onclick="displayRecipeDetails(${recipe.id})">
                        <img src="${recipe.image}" alt="${recipe.title}">
                        <h3>${recipe.title}</h3>
                        <div class="recipe-meta">
                            <span><i class="fas fa-clock"></i> ${recipe.prepTime}</span>
                            <span><i class="fas fa-fire"></i> ${recipe.cookTime}</span>
                            <span><i class="fas fa-signal"></i> ${recipe.difficulty}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Initialize all features
    displayTestimonials();
    initScrollToTop();
    initCategoryCards();
    displayRecipesByCategory('all');
});
