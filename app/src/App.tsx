import { Route, Routes } from "react-router"

import './App.css'
import SignIn from "./views/SignIn"
import PageNotFound from "./views/PageNotFound"
import SignUp from "./views/SignUp"
import { Link } from "react-router-dom"
import AccountView from "./views/AccountView"
import Home from "./views/Home"; 

let links = [
{ text: "Home ", link: "home" }, 
 { text: "Sign in ", link: "sign-in" },
 { text: "Sign up ", link: "sign-up" },
  
]

// main App component
function App() {

  return (
    <div>
      <div>
        {links.map(link => {
          return <Link to={link.link}>{link.text}</Link>
        })}
      </div>
      <Routes>
        <Route 
          index 
          element={<SignIn />}
        />

        <Route 
          path="home" 
          element={<Home />} 
        />
        
        <Route 
          path="sign-up" 
          element={<SignUp />}
        />
        
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  )
}

export default App
