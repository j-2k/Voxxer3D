class Time {
    // Static properties
    static before: number = 0;
    static now: number = 0;
    static deltaTime: number = Time.now - Time.before;
    static time: number = 0;

    // Static methods
    static CalculateTimeVariables(): void {
        // Update the current time in seconds
        this.now = performance.now() * 0.001;
        
        // Calculate the time difference between now and before
        this.deltaTime = Time.now - Time.before;
        
        // Accumulate the total elapsed time
        this.time = Time.time + Time.deltaTime;
        
        // Update before time to the current time for the next cycle
        this.before = Time.now;
    }

    // Static method Example for static classes
    static GetFPS(): number {
        return 1 / Time.deltaTime;
    }

    // Instance method Example for static classes
    instanceMethod(): void {
        console.log(Time.CalculateTimeVariables()); // Accessing static property
        Time.CalculateTimeVariables(); // Calling static method
    }
}

/* Example of calling an instance method of a "static" class
// Create an instance of the class
const timeInstance = new Time();

// Call the instance method
timeInstance.instanceMethod();
*/

export default Time;