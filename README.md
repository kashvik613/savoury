# Recipe App

A modern recipe application built with HTML, CSS, and JavaScript.

## Features

- Search for recipes by name, ingredients, or category
- View detailed recipe instructions and ingredients
- Responsive design that works on all devices
- Dark mode toggle
- Testimonials from users
- Weekly featured recipe
- Category-based browsing

## Deployment Instructions for Vercel

### Option 1: Deploy with Vercel CLI

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Navigate to the project directory:
   ```
   cd Recipe-App-main
   ```

3. Deploy to Vercel:
   ```
   vercel
   ```

4. Follow the prompts to complete deployment.

### Option 2: Deploy with Vercel Dashboard

1. Visit [Vercel](https://vercel.com) and sign in or create an account.
2. Click "New Project" on the dashboard.
3. Import your repository from GitHub, GitLab, or Bitbucket.
4. Configure your project settings:
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
5. Click "Deploy" to start the deployment process.

## Local Development

To run this project locally, simply open the `index.html` file in your browser.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- GSAP for animations
- FontAwesome for icons
- TheMealDB API for recipe data

## Troubleshooting

### CSS Not Loading After Deployment

If CSS is not loading after deployment on Vercel, try the following:

1. Make sure to use the exact configuration files included in this repository:
   - vercel.json
   - vercel.build.sh (make it executable with `chmod +x vercel.build.sh` before deploying)

2. Check that all paths in HTML are using absolute paths (starting with `/`):
   ```html
   <link rel="stylesheet" href="/style.css">
   <script src="/script.js"></script>
   ```

3. Clear your browser cache after deployment.

4. If the issue persists, try deploying with the Vercel CLI using:
   ```
   vercel --prod
   ```

5. Verify in the Vercel build logs that the CSS file was correctly uploaded.
