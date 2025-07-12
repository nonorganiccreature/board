import { Application } from "./app";
import "./assets/style.css";


document.addEventListener('DOMContentLoaded', () => {
    const app = new Application()
    app.init()
    app.start()
})