import MainContent from "../component/Home/MainContent";
import CardContainer from "../component/Home/CardContainer";
import About from "../component/Home/About";
import Footer from "@/component/footer/Footer";
import NotificationPopUp from "../component/NotificationPopup"; // Import the NotificationPopUp component

const HomePage = () => {
  return (
    <div>
      <main>
        <MainContent />
        <CardContainer />
        <About />
        <Footer />
        <NotificationPopUp /> 
      </main>
    </div>
  );
};

export default HomePage;
