export type SessionUser = {
  email: string
  role: 'hr_manager'
}

export type SessionPayload = {
  user: SessionUser | null
  csrf_token: string
}

export type SignInCredentials = {
  email: string
  password: string
}

export type SalaryRecord = {
  id: number
  amount: string
  currency: string
  effective_date: string
  end_date: string | null
}

export type Employee = {
  employee_number: string
  first_name: string
  last_name: string
  email: string | null
  country_code: string
  department: string
  job_title: string
  status: 'active' | 'on_leave' | 'terminated'
  hire_date: string
  current_salary: SalaryRecord | null
  salary_records?: SalaryRecord[]
}

export type EmployeeFilters = {
  q?: string
  country?: string
  department?: string
  status?: string
  page?: number
  per_page?: number
}

export type EmployeeDirectoryPayload = {
  data: Employee[]
  meta: {
    page: number
    per_page: number
    total_count: number
    total_pages: number
  }
}

export type EmployeePayload = {
  data: Employee
}

export type EmployeeInput = Omit<Employee, 'current_salary' | 'salary_records'>

export type ValidationErrors = Record<string, string[]>
