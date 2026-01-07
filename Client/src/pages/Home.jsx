// CineGo / Client / src / pages / Home.jsx
import Banner from "../components/Banner";
import Movies from "../components/Movies";
import News from "../components/News";
import Trailers from "../components/Trailers";

const Home = () => {
  return (
    <div>
      <Banner />
      <Movies />
      <Trailers />
      <News />
    </div>
  );
};

export default Home;
