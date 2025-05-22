import { Button } from './ui/button'
import { Input } from './ui/input'

export function SignInForm() {
  return (
    <div className="space-y-3">
      <Input placeholder="Email" />
      <Input placeholder="Password" />
      <Button className="w-full cursor-pointer" type="submit">
        Continuar
      </Button>
    </div>
  )
}

export function SignUpForm() {
  return (
    <div className="space-y-3">
      <Input placeholder="Name" />
      <Input placeholder="Email" />
      <Input placeholder="Password" />
      <Button className="w-full cursor-pointer" type="submit">
        Continuar
      </Button>
    </div>
  )
}
