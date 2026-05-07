export const getRequiredEnv = (name) => {
    const value = process.env[name]

    if(!value) {
        throw new Error(`Falta configurar la variable de entorno ${name}`);
    }
    return value
}
