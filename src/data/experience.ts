export type Job = {
  role: string
  company: string
  dates: string
  location: string
  // the short version shown by default
  summary: string
  // the full breakdown behind read more
  bullets: string[]
}

export type School = {
  school: string
  dates: string
  detail: string
}

// jobs, newest first, bullets match the resume
export const jobs: Job[] = [
  {
    role: 'Software Engineering Intern',
    company: 'Ormco (Envista)',
    dates: 'Dec 2025 - Present',
    location: 'Pomona, CA',
    summary:
      'Build production .NET apps and computer vision systems for manufacturing lines, including a robot-driven inspection pipeline that checks 200+ trays an hour.',
    bullets: [
      'Build and deploy production .NET WPF applications (C#, XAML, MVVM) used daily by manufacturing line operators worldwide',
      'Barmold AQI: Led development of a computer vision pipeline (Basler cameras, Pylon SDK) that finds molds on trays and drives a Universal Robots arm through a custom C# Modbus TCP layer, automating inspection of 200+ trays/hr',
      'Trained and integrated an OCR model that reads engravings on resin molds and checks tray condition (present/absent, full/empty), moving QC checks onto the line and cutting inspection time by 80%',
      'Paperless: Moved the full work-order process off paper using .NET, MSSQL, and AWS S3, removing hundreds of printed pages a day and cutting order processing time by over 50%',
      'Rewrote an unstable RFID read/write tool from scratch as a multithreaded app, speeding up tag reads/writes and stopping up to 5 crashes a day under heavy load',
      'Shipped a cassette damage tracker and label generator (backed by AWS S3) to production at the Mexicali plant',
    ],
  },
  {
    role: 'IT Technician',
    company: 'Alfa Business',
    dates: 'May 2025 - Dec 2025',
    location: 'Riverside, CA',
    summary: 'Tier 1 to 3 IT support for 200+ users, plus Office 365 and Azure AD admin for 10+ companies.',
    bullets: [
      'Provided Tier 1 to 3 support for hardware, networking, and software for 200+ users on Windows and macOS',
      'Managed Office 365 and Azure AD for 10+ companies, handling user setup plus onboarding and offboarding',
      'Wrote Bash, PowerShell, and Java scripts to automate antivirus detection, system and SQL Server monitoring, and firewall setup',
    ],
  },
]

// schools, newest first
export const education: School[] = [
  {
    school: 'California Baptist University',
    dates: 'Expected 2027',
    detail: 'B.S. Computer Science, Specialization in Machine Learning and Artificial Intelligence',
  },
  {
    school: 'Cal Poly Pomona',
    dates: 'Aug 2023 - Dec 2025',
    detail: 'Coursework in Computer Information Systems',
  },
]
