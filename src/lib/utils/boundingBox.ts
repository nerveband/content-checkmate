/**
 * Converts a bounding box to natural language location description
 */
export function describeLocation(boundingBox: {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}): string {
  const centerX = (boundingBox.x_min + boundingBox.x_max) / 2;
  const centerY = (boundingBox.y_min + boundingBox.y_max) / 2;

  let vertical = '';
  let horizontal = '';

  if (centerY < 0.33) vertical = 'top';
  else if (centerY > 0.67) vertical = 'bottom';
  else vertical = 'center';

  if (centerX < 0.33) horizontal = 'left';
  else if (centerX > 0.67) horizontal = 'right';
  else horizontal = 'center';

  if (vertical === 'center' && horizontal === 'center') {
    return 'center of the image';
  } else if (vertical === 'center') {
    return `${horizontal} side of the image`;
  } else if (horizontal === 'center') {
    return `${vertical} of the image`;
  } else {
    return `${vertical}-${horizontal} corner of the image`;
  }
}
