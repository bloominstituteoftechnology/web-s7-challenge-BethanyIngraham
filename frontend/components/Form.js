import React, { useEffect, useState } from 'react'
import * as yup from 'yup'
import axios from 'axios'

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.
const formSchema = yup.object().shape({
  fullName: yup
    .string()
    .trim()
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong)
    .required(),
  size: yup
    .string()
    .oneOf(['S','M','L'], validationErrors.sizeIncorrect)
    .required()
})

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]
const initialValues = {
  size: '',
  fullName: '',
  toppings: []
}

const initialErrors = {
  size: '',
  fullName: ''
}

export default function Form() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState(initialErrors)
  const [success, setSucces] = useState('')
  const [failure, setFailure] = useState('')
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    formSchema.isValid(values).then((isValid) => {
      setIsEnabled(isValid)
    })
  }, [values])

  const onChange = (evt) => {
    let {id, value, type, checked} = evt.target;
    type === 'checkbox' ? checked : value; 
    //if checked -> put into toppoings intital value array via key (name)
    setValues({...values, [id]: value})
    yup
    .reach(formSchema, id)
    .validate(value)
    .then(() => {setErrors({...errors, [id]: ''}) })
    .catch((err) => {setErrors({...errors, [id]: err.errors[0]}) })
  }

  const handleSubmit = (evt) => {
    evt.preventDefault();
    const {fullName: customer, size, toppings} = values;
    axios
    .post('http://localhost:9009/api/order', {
       customer, size, toppings
    })
    //is this correct? debugger goes where?
    .then((res) => {
        setSucces(res.data.message)
        setFailure('')   
    })
    .catch((res) => {
        setSucces('') 
        setFailure(res.response.data.message)      
    });
    setValues(initialValues);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      {success && <div className='success'>{success}</div>}
      {failure && <div className='failure'>{failure}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input onChange={onChange} placeholder="Type full name" id="fullName" type="text" value={values.fullName}/>
        </div>
        {errors.fullName && <div className='error'>{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select onChange={onChange} id="size" value={values.size}>
            <option value="">----Choose Size----</option>
            {/* Fill out the missing options */}
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
        {errors.size && <div className='error'>{errors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppings.map((tp, idx) =>
         <label key={idx}>
          <input 
            name={tp.topping_id} 
            type='checkbox' 
            onChange={onChange} 
            checked={values.tp}
          />
         {tp.text}<br/>
        </label>)}    
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit"  disabled={!isEnabled} />
    </form>
  )
}
