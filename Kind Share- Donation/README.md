# KindShare - Donation Platform

KindShare is a web platform that connects generous donors with organizations that help people in need. The platform facilitates the donation of various items including educational materials, food items, household goods, and clothing.

## Features

- **Beautiful Splash Screen**: Engaging welcome animation
- **Category-based Donations**: Easy categorization of donation items
- **Image Upload**: Multiple image upload support for donation items
- **Real-time Status Tracking**: Track donation status from submission to collection
- **Gamification**: Points system and achievement badges for donors
- **Email Notifications**: Automated updates about donation status
- **Responsive Design**: Works seamlessly on all devices

## Tech Stack

### Frontend
- HTML5
- CSS3 (with animations and responsive design)
- JavaScript (Vanilla JS)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Nodemailer

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Gmail account (for email notifications)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KindShare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Rename `.env.example` to `.env`
   - Update the following variables in `.env`:
     ```
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/kindshare
     JWT_SECRET=your-secret-key-here
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASS=your-email-app-password
     ```
   Note: For EMAIL_PASS, use an App Password from your Gmail account

4. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Default connection string is: `mongodb://localhost:27017/kindshare`

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

6. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - The frontend files are served statically by the Express server

## Project Structure

```
KindShare/
├── public/
│   └── uploads/        # Uploaded images directory
├── .env                # Environment variables
├── index.html          # Frontend entry point
├── styles.css          # Stylesheet
├── script.js           # Frontend JavaScript
├── server.js           # Backend entry point
├── package.json        # Project dependencies
└── README.md          # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Donations
- `POST /api/donations` - Submit new donation
- `GET /api/donations/:id` - Get donation details
- `PUT /api/donations/:id/status` - Update donation status

### Statistics
- `GET /api/stats` - Get platform statistics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security Considerations

- JWT is used for authentication
- Passwords are hashed using bcrypt
- File uploads are restricted to images only
- Environment variables are used for sensitive data
- CORS is enabled for API security

## Future Enhancements

- [ ] Admin dashboard for organizations
- [ ] Real-time chat between donors and organizations
- [ ] Social media sharing integration
- [ ] Mobile app development
- [ ] Analytics dashboard
- [ ] Multiple language support
- [ ] Payment integration for monetary donations

## License

This project is licensed under the MIT License - see the LICENSE file for details.