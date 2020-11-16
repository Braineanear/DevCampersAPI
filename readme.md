# DevCamper Backend API Specifications

## Tools

- Node.js - https://nodejs.org/en/
- VSCode - https://code.visualstudio.com/
- Postman - https://www.getpostman.com/
- Git - https://git-scm.com/
- MongoDB - https://www.mongodb.com/
- MailTrap - https://mailtrap.io/
- Docgen - https://github.com/thedevsaddam/docgen
- MapQuest Dev API - https://developer.mapquest.com/

## NPM Packages

- dotenv - https://github.com/motdotla/dotenv#readme
- morgan - https://github.com/expressjs/morgan
- multer - https://github.com/expressjs/multer
- eslint - https://github.com/eslint/eslint
- eslint-config-airbnb - https://github.com/airbnb/javascript
- eslint-config-prettier - https://github.com/prettier/eslint-config-prettier
- eslint-plugin-import - https://github.com/prettier/eslint-config-prettier
- eslint-plugin-jsx-a11y - https://github.com/evcohen/eslint-plugin-jsx-a11y
- eslint-plugin-node - https://github.com/mysticatea/eslint-plugin-node
- eslint-plugin-prettier - https://github.com/mysticatea/eslint-plugin-node
- eslint-plugin-react - https://github.com/yannickcr/eslint-plugin-react
- ndb - https://github.com/GoogleChromeLabs/ndb
- prettier - https://github.com/prettier/prettier
- nodemon - https://github.com/remy/nodemon
- chalk - https://github.com/chalk/chalk
- slugify - https://github.com/simov/slugify
- node-geocoder - https://github.com/nchaulet/node-geocoder
- bcryptjs - https://github.com/dcodeIO/bcrypt.js#readme
- jsonwebtoken - https://github.com/auth0/node-jsonwebtoken
- nodemailer - https://nodemailer.com/about/
- express-mongo-sanitize - https://github.com/fiznool/express-mongo-sanitize#readme
- xss-clean - https://github.com/jsonmaur/xss-clean
- helmet - https://github.com/helmetjs/helmet
- hpp - https://github.com/analog-nico/hpp
- express-rate-limit - https://github.com/nfriedly/express-rate-limit
- cors - https://github.com/expressjs/cors
- pm2 - https://github.com/Unitech/pm2

### Bootcamps
- List all bootcamps in the database
   * Pagination
   * Select specific fields in result
   * Limit number of results
   * Filter by fields
- Search bootcamps by radius from zipcode
  * Use a geocoder to get exact location and coords from a single address field
- Get single bootcamp
- Create new bootcamp
  * Authenticated users only
  * Must have the role "publisher" or "admin"
  * Only one bootcamp per publisher (admins can create more)
  * Field validation via Mongoose
- Upload a photo for bootcamp
  * Owner only
  * Photo will be uploaded to local filesystem
- Update bootcamps
  * Owner only
  * Validation on update
- Delete Bootcamp
  * Owner only
- Calculate the average cost of all courses for a bootcamp
- Calculate the average rating from the reviews for a bootcamp

### Courses
- List all courses for bootcamp
- List all courses in general
  * Pagination, filtering, etc
- Get single course
- Create new course
  * Authenticated users only
  * Must have the role "publisher" or "admin"
  * Only the owner or an admin can create a course for a bootcamp
  * Publishers can create multiple courses
- Update course
  * Owner only
- Delete course
  * Owner only
  
### Reviews
- List all reviews for a bootcamp
- List all reviews in general
  * Pagination, filtering, etc
- Get a single review
- Create a review
  * Authenticated users only
  * Must have the role "user" or "admin" (no publishers)
- Update review
  * Owner only
- Delete review
  * Owner only

### Users & Authentication
- Authentication will be ton using JWT/cookies
  * JWT and cookie should expire in 30 days
- User registration
  * Register as a "user" or "publisher"
  * Once registered, a token will be sent along with a cookie (token = xxx)
  * Passwords must be hashed
- User login
  * User can login with email and password
  * Plain text password will compare with stored hashed password
  * Once logged in, a token will be sent along with a cookie (token = xxx)
- User logout
  * Cookie will be sent to set token = none
- Get user
  * Route to get the currently logged in user (via token)
- Password reset (lost password)
  * User can request to reset password
  * A hashed token will be emailed to the users registered email address
  * A put request can be made to the generated url to reset password
  * The token will expire after 10 minutes
- Update user info
  * Authenticated user only
  * Separate route to update password
- User CRUD
  * Admin only
- Users can only be made admin by updating the database field manually
