export function Close({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16.5962 5.28247L18.7175 7.40379L7.40381 18.7175L5.28249 16.5962L16.5962 5.28247Z"
        fill="currentColor"
      />
      <path
        d="M18.7175 16.5962L16.5962 18.7175L5.28249 7.40379L7.40381 5.28247L18.7175 16.5962Z"
        fill="currentColor"
      />
    </svg>
  );
}
