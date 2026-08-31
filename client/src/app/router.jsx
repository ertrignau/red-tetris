import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/Home.jsx";
import Game from "../pages/Game/Game.jsx";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />
	},
	{
		path: "/:room/:player",
		element: <Game />
	}
]);

export default router;
