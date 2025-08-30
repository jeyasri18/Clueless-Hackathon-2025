// const getUserFromDatabase
// need to input all the import all the consts 



const AccountView = () => {
  let data = [
    {label: "First name", content: "John"},
    {label: "Last name", content: "Doe"},
    {label: "Email", content: "john.doe@example.com"}
  ]

  return (<div>
    <h1>Account View</h1>
    {data.map(element => {
      return <div>
        <span>{element.label}</span>
        <span>{element.content}</span>
      </div>
    })}
  </div>)
}

export default AccountView