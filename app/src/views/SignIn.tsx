import { FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import{auth} from "../firebase/config";

export type FormInput = {
  label: string, 
  id: string, 
  type: string
}

export const GenerateFormElements = (formInputs: FormInput[]) => {
  return formInputs.map(formInput => {
    return (<div className="flex">
      <label>{formInput.label}</label>
      <input className="p-1" id={formInput.id} type={formInput.type}/>
    </div>)
  })
}

const SignIn = () => {
  let formInputs: FormInput[] = [
    {label: "Email", id: "email", type: "email"},
    {label: "Password", id: "password", type: "password"}
  ];

  const signIn = (event: FormEvent) => {
    event.preventDefault();

    // @ts-ignore
    const elementsArray = [...event.target.elements];

    const data = elementsArray.reduce((acc, element) => {
      if (element.id) {
        acc[element.id] = element.value;
      }

      return acc;
    }, {});

    try {
      if (data.email === '') throw("Please enter an email")
      if (data.password === '') throw("Please enter a password")
      if (data.password.length < 8) throw("Your password should be at least 8 characters long")
      
      
      signInWithEmailAndPassword(auth,data.email,data.password)
      .then((response) => {
        sessionStorage.setItem(response.user.uid, "User ID");
        window.location.href = "/account";

      })
    }
    catch (error) {
      alert(error);
    }

  }

  return (<form onSubmit={signIn}>
    <h1>Sign in</h1>
    {GenerateFormElements(formInputs)}
    <button>Submit</button>
  </form>)
}

export default SignIn