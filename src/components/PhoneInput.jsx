import { useState } from 'react'

export default function PhoneInput({ placeholder = 'Telefone', ...props }) {
  const [phone, setPhone] = useState('')

  const formatPhoneNumber = (value) => {
    // Remove tudo que não é número
    const numbersOnly = value.replace(/\D/g, '')
    
    // Limita a 11 dígitos
    const limited = numbersOnly.slice(0, 11)
    
    // Aplica a máscara (99) 99999-9999
    let formatted = limited
    if (limited.length > 0) {
      formatted = `(${limited.slice(0, 2)}`
    }
    if (limited.length > 2) {
      formatted += `) ${limited.slice(2, 7)}`
    }
    if (limited.length > 7) {
      formatted += `-${limited.slice(7)}`
    }
    
    return formatted
  }

  const handleChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
    
    // Passa o valor sem máscara para o componente pai se necessário
    if (props.onChange) {
      props.onChange({ ...e, target: { ...e.target, value: formatted } })
    }
  }

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={phone}
      onChange={handleChange}
      maxLength="15"
      {...props}
    />
  )
}
