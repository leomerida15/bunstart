// Ejemplo de API de greet
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Función con tipos para demo
export function add(a: number, b: number): number {
  return a + b;
}

// Clase de ejemplo
export class Calculator {
  private value: number = 0;

  add(n: number): this {
    this.value += n;
    return this;
  }

  subtract(n: number): this {
    this.value -= n;
    return this;
  }

  getValue(): number {
    return this.value;
  }
}

console.log("¡Módulo cargado! (dev)");
