import jwt from 'jsonwebtoken'

export const generateAccessToken = (userId, role) => {
   return jwt.sign({ id: userId, role: role }, process.env.JWT_SECRET_ACCESS, { expiresIn: '10m' })
}

export const generateRefreshToken = (userId, role) => {
   return jwt.sign({ userId: userId, role: role}, process.env.JWT_SECRET_REFRESH, { expiresIn: '1d' })
}