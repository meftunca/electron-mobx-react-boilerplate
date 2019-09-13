import React from "react";
import { render } from "react-dom";
document.title = "2PX";
let root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);
const App = () => (
	<div>
		<h1>Hello World</h1>
	</div>
);
render(<App />, document.getElementById("root"));
