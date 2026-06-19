export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-8">
      <p className="text-center text-sm text-neutral-500">
        © Joshua Cortes {new Date().getFullYear()}. All Rights Reserved.
      </p>
    </footer>
  )
}