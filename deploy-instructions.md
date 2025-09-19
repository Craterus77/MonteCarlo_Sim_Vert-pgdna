# Deployment Instructions

## GitHub Setup
After creating your GitHub repository, run these commands:

```bash
cd "C:\Users\NickWatts\GrowthAg\AllCoHome - Documents\2b IAG Shared\Product Trials\000 Vert Trial 2023\2024-25 Soil sampling protocol\Simulation App"

# Add your GitHub repository as origin (replace with your actual repo URL)
git remote add origin https://github.com/yourusername/your-repo-name.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Vercel Deployment

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a React app
5. Click "Deploy"

The app will be automatically deployed and you'll get a live URL!

## Environment Setup (if needed)
No environment variables are required for this app.

## Custom Domain (optional)
After deployment, you can add a custom domain in the Vercel dashboard under your project settings.