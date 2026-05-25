import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import Home from "@/pages/Home";
import Jurnal from "@/pages/Jurnal";
import Dreamy from "@/pages/Dreamy";
import NotFound from "@/pages/not-found";
import MusicPlayer from "@/components/MusicPlayer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/jurnal" component={Jurnal} />
      <Route path="/dreamy" component={Dreamy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function PersistentPlayer() {
  const [location] = useLocation();
  const show = location === "/jurnal" || location === "/dreamy";
  if (!show) return null;
  return <MusicPlayer autoPlay variant={location === "/dreamy" ? "dark" : "light"} />;
}

export default function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
      <PersistentPlayer />
    </WouterRouter>
  );
}
