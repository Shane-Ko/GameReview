import { Link } from "react-router-dom";

export default function Header() {
    return (
        <nav className="top-nav">
            <div className="nav-logo">
                <Link to="/">Under2Hours</Link>
            </div>
            <div className="nav-menu">
                <Link to="/">REVIEWS</Link>
                <Link to="/best">BEST</Link>
            </div>
            <div className="nav-right">
                <Link to="/admin">ADMIN</Link>
            </div>
        </nav>
    );
}