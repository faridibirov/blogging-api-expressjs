export default function roleMiddleware(roles) { 

    return (req, res, next) => {
        if(!roles.inclues(req.user.role)) {
            return res.status(403).json({message: "Forbidden: Insufficient role"});
        }
        next();
    };

}