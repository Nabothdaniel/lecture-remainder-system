import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useUserStore } from "./store/authStore";


const App = () => {
  useEffect(() => {
  useUserStore.getState().initAuth();
}, []);


  return( <Outlet />)
}

export default App