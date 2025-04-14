# Frontend Deployment on Render

This guide explains how to deploy the frontend application on Render.

## Deployment Steps

### Option 1: Manual Deployment

1. Create a new Static Site on Render
   - Go to the Render dashboard: https://dashboard.render.com/
   - Click "New" and select "Static Site"

2. Connect your GitHub repository
   - Select the repository containing your frontend code
   - Configure the following settings:
     - **Name**: `isewr-frontend` (or your preferred name)
     - **Branch**: `main` (or your preferred branch)
     - **Root Directory**: `frontend` (if your frontend code is in a subdirectory)
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `build`

3. Add environment variables:
   - `REACT_APP_SUPABASE_URL`: Your Supabase URL
   - `REACT_APP_SUPABASE_KEY`: Your Supabase key 
   - `REACT_APP_BACKEND_URL`: `https://isewr-backend.onrender.com`
   - `GENERATE_SOURCEMAP`: `false`

4. Click "Create Static Site"

### Option 2: Blueprint Deployment with render.yaml

1. Push the `render.yaml` file to your GitHub repository
2. Go to the Render dashboard and click "Blueprint"
3. Connect your GitHub repository containing the `render.yaml` file
4. Review the configuration (Render will detect it automatically)
5. Add sensitive environment variables as needed
6. Deploy the service

## Verifying Your Deployment

1. Once deployed, Render will provide a URL for your static site
2. Visit the URL to verify that your frontend is working correctly
3. Test functionality to ensure it connects to the backend properly

## Troubleshooting

If you encounter issues:

1. **CORS errors**: Ensure your backend CORS configuration includes your frontend domain
2. **API connection issues**: 
   - Verify the environment variables are set correctly
   - Check that the backend URL is spelled correctly (it should be `https://isewr-backend.onrender.com`)
   - Confirm your backend is running properly 
3. **Build failures**: 
   - Check Render logs for any build errors
   - Try running the build locally to identify issues

## Custom Domain (Optional)

To set up a custom domain for your frontend:

1. Go to your static site's settings in the Render dashboard
2. Click on "Custom Domain"
3. Follow the instructions to add and verify your domain

## Updating Your Deployment

Your site will automatically redeploy when you push changes to your repository's configured branch. 