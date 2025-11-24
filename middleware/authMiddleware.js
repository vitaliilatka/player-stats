import jwt from "jsonwebtoken";

export function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Нет токена" });

    const token = header.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ message: "Нет доступа" });
      }

      next();
    } catch (err) {
      res.status(401).json({ message: "Неверный токен" });
    }
  };
}
