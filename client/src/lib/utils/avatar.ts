export function getInitialsAvatar(name: string) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate a consistent color based on the name
  const hue = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  const backgroundColor = `hsl(${hue}, 65%, 85%)`;
  const textColor = `hsl(${hue}, 65%, 35%)`;

  const svg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="${backgroundColor}"/>
      <text 
        x="100" 
        y="100" 
        font-family="system-ui" 
        font-size="80" 
        font-weight="bold"
        fill="${textColor}"
        text-anchor="middle" 
        dominant-baseline="middle"
      >${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function getDefaultCover(userId: string) {
  // Generate a consistent pattern based on userId
  const hue = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;

  const svg = `
    <svg width="1200" height="400" viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path 
            d="M 0 0 L 40 0 L 40 40 L 0 40 Z" 
            fill="none" 
            stroke="hsl(${hue}, 65%, 85%)"
            stroke-width="1"
          />
        </pattern>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(${hue}, 65%, 95%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(${hue}, 65%, 85%);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <rect width="100%" height="100%" fill="url(#grid)"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
