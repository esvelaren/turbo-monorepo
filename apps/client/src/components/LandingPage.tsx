import { useEffect, useState } from "react";
import reactLogo from ".././assets/react.svg";
import viteLogo from "/vite.svg";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const [greeting, setGreeting] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    fetch("/api")
      .then((res) => res.text())
      .then(setGreeting);
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>{greeting}</h1>
      {/* Go to About page using navigate*/}
      <button onClick={() => navigate("/about")}>Go to About Page</button>
    </>
  );
};
export default LandingPage;
