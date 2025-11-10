# SecureCloud - Modern Cloud Storage Solution

A secure, user-friendly cloud storage platform built with **React** (frontend) and **Node.js/Express** (backend).

## Current Features 

We have completed the foundational structure and successfully integrated the core user authentication APIs, establishing a full-stack connection.

###  User Interface (UI) - Polished and Consistent
The entire application features a cohesive purple and white design theme across all main pages.

###  Authentication (Frontend & Backend Integrated)
The authentication workflow is fully connected and functional, managing user sessions via JWTs.
* **Login Page:**
    * Custom purple/white design implemented.
    * **Login API integration** complete using `authService`.
    * Includes "Forgot Password?" and Sign-up redirect links.
* **Registration Page:**
    * Custom purple/white design implemented, including the Confirm Password field.
    * **Registration API integration** complete using `authService`.
* **Global Auth Context:** User state (login/logout, user data) is managed globally using the `useAuth` hook.

###  Dashboard (UI Complete & Dynamic)
The dashboard UI is fully styled and dynamic, ready for file logic implementation.
* **Sidebar Navigation:** Uses the primary purple color for the active state.
* **Main Content Area:**
    * Dynamic welcome header (`Welcome, {UserName}!`).
    * Styled file upload section and buttons.
    * File listing table now correctly handles an empty state (no files listed).
    * All mock data has been removed.

##  Tech Stack

### Frontend
* **React.js**
* **React Router** for navigation
* Custom CSS for styling

### Backend
* **Node.js/Express**
* **JWT** (JSON Web Tokens) for authentication
* (Implied) Database and File Storage services will be integrated next.

## Next Critical Steps (Focus: Security)
* **Client-Side Encryption:** Implement the `fileService` to handle file encryption before upload.
* **File Management:** Implement file upload, listing, and deletion API calls.
* **Cloud Storage Integration:** Connect the backend to a secure cloud storage solution.

---

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.


### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
