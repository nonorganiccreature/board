export class PointNotOnTheEdgeError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'PointNotOnTheEdgeError'
    }
}

export class ConnectionPointAngleNotPerpendicularError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ConnectionPointAngleNotPerpendicularError'
    }
}