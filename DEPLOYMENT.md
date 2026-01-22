# Deployment Guide for ChitChat

This guide explains how to deploy the ChitChat application (MERN Stack) to **Render** using two separate services: one for the backend (Server) and one for the frontend (Client).

## Prerequisites

1.  **GitHub Account**: You need to push this code to a GitHub repository.
2.  **Render Account**: Sign up at [render.com](https://render.com).
3.  **MongoDB Atlas Account**: You need a cloud MongoDB database.

## Step 1: Push Code to GitHub

1.  Initialize git in the project root if you haven't already:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a new repository on GitHub.
3.  Link your local repository to GitHub and push:
    ```bash
    git remote add origin <YOUR_GITHUB_REPO_URL>
    git push -u origin master
    ```

## Critical Step: MongoDB Atlas IP Whitelist

**Before deploying, you MUST allow connections from Render.**

1.  Log in to your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2.  Go to **Network Access** (in the left sidebar under Security).
3.  Click **+ Add IP Address**.
4.  Select **Allow Access from Anywhere** (or enter `0.0.0.0/0`).
5.  Click **Confirm**.
    *   *Reason: Render uses dynamic IP addresses, so you cannot whitelist a specific IP. You must allow all IPs.*

## Step 2: Deploy the Server (Backend)

1.  Go to your [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    *   **Name**: `chitchat-server` (example)
    *   **Root Directory**: `server`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Plan Type**: `Free`
5.  **Environment Variables**:
    Add the following keys in the "Environment" tab:

    | Key | Value | Description |
    | --- | --- | --- |
    | `NODE_ENV` | `production` | Required. |
    | `MONGO_URI` | `mongodb+srv://...` | **Required**. Your MongoDB Atlas connection string (already configured in code but safer here). |
    | `JWT_SECRET_KEY` | `some_random_secret` | Secure random string for JWT. |
    | `JWT_EXPIRE` | `7d` | Token expiration. |
    | `COOKIE_EXPIRE` | `7` | Cookie expiration (days). |
    | `CLOUDINARY_CLOUD_NAME`| `...` | Your Cloudinary Cloud Name. |
    | `CLOUDINARY_API_KEY` | `...` | Your Cloudinary API Key. |
    | `CLOUDINARY_API_SECRET`| `...` | Your Cloudinary API Secret. |
    | `FRONTEND_URL` | `https://your-client-app.onrender.com` | **Update this later** after deploying the client. For now, you can put `*` or a placeholder. |

6.  Click **Create Web Service**.
7.  **Copy the Server URL** (e.g., `https://chitchat-server.onrender.com`) once it is live.

## Step 3: Deploy the Client (Frontend)

1.  Go to your [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **Static Site**.
3.  Connect your GitHub repository.
4.  Configure the site:
    *   **Name**: `chitchat-client` (example)
    *   **Root Directory**: `client`
    *   **Build Command**: `npm run build`
    *   **Publish Directory**: `dist`
5.  **Environment Variables**:
    Add the following key:

    | Key | Value | Description |
    | --- | --- | --- |
    | `VITE_SERVER_URL` | `https://chitchat-server.onrender.com` | **Paste your Server URL here**. Do NOT include a trailing slash (e.g., no `/`). |

6.  Click **Create Static Site**.
7.  **Copy the Client URL** (e.g., `https://chitchat-client.onrender.com`) once it is live.

## Step 4: Final Configuration

1.  Go back to your **Server** service on Render.
2.  Go to **Environment Variables**.
3.  Update `FRONTEND_URL` to your actual **Client URL** (e.g., `https://chitchat-client.onrender.com`).
4.  **Save Changes**. Render will restart the server.

## Troubleshooting

*   **Database Connection**: If the server fails to start, check `MONGO_URI`. Ensure your MongoDB Atlas Network Access allows `0.0.0.0/0` (Allow Access from Anywhere).
*   **CORS Errors**: If the client can't talk to the server, ensure `FRONTEND_URL` in Server env vars matches the Client URL exactly (no trailing slash usually).
*   **Mixed Content**: Ensure both Server and Client are on `https`. Render handles this automatically.
