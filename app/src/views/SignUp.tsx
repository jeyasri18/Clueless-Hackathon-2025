import { FormEvent } from "react";
import { FormInput, GenerateFormElements } from "./SignIn";
import { createUserWithEmailAndPassword } from "firebase/auth";
import{auth} from "../firebase/config";


// const addUserToDatabase = async (userID: string, data: )
//-------------------------CHATGPT CODE-----------------------
// const addUserToDatabase = async (userID: string, data: { [key: string]: any }) => {
//   try {
//     await setDoc(data(data, "users", userID), data);
//     console.log("User added to the database successfully");
//   } catch (error) {
//     console.error("Error adding user to the database:", error);
//   }
// };
//----------------------------------------------------------------------
// this needs to be compleated there is a long list  of code here 

const SignUp = () => {
  let formInputs: FormInput[] = [
    {label: "First Name", id: "firstName", type: "text"},
    {label: "Last Name", id: "lastName", type: "text"},
    {label: "Email", id: "email", type: "email"},
    {label: "Password", id: "password", type: "password"},
    {label: "Confirm Password", id: "confirmPassword", type: "password"}

  ];

  const signUp = (event: FormEvent) => {
    event.preventDefault();

    // @ts-ignore
    const elementsArray = [...event.target.elements];

    const data = elementsArray.reduce((acc, element) => {
      if (element.id) {
        acc[element.id] = element.value;
      }

      return acc;
    }, {});

    // error handling
    try {
      if (data.firstName === '') throw("Please enter your first name")
      if (data.lastName === '') throw("Please enter your last name")
      if (data.email === '') throw("Please enter an email")
      if (data.password === '') throw("Please enter a password")
      if (data.password.length < 8) throw("Your password should be at least 8 characters long")
      if (data.confirmPassword === '') throw("Please confirm your password")
      if (data.password !== data.confirmPassword) throw("Passwords do not match")

      createUserWithEmailAndPassword(auth, data.email, data.password)
      .then(async (response) => {
        // await addUserToDatabase(response.user.uid, {
        // this is all good ton uncomment ince the function is created 
        // });
        sessionStorage.setItem(response.user.uid, "User ID");
        window.location.href = "/account";

      })
      .catch ((error) => {
        alert(error);
      })

    }
    catch (error) {
      alert(error);
    }

  }

  return (<form onSubmit={signUp}>
    <h1>Sign up</h1>
    {GenerateFormElements(formInputs)}
    <button>Submit</button>
  </form>)
}

export default SignUp