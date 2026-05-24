import { Switch, Route, Router as WouterRouter } from "wouter";
import Home from "@/pages/Home";
import Jurnal from "@/pages/Jurnal";
import Dreamy from "@/pages/Dreamy";
import NotFound from "@/pages/not-found";

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

export default function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}
