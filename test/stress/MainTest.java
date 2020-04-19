package test.stress;

import java.util.concurrent.atomic.AtomicInteger;

public class MainTest {
    public static boolean exceptionThrow = false;
    public static AtomicInteger effectiveThreads;
    public static long prevTime;

    public static void main(String[] args) {
        int numOfThreads = 5;
        effectiveThreads = new AtomicInteger(numOfThreads);

        long startTime = System.nanoTime();
        prevTime = startTime;

        ClientFlow[] clients = new ClientFlow[numOfThreads];
        Thread[] threads = new Thread[numOfThreads];
        for (int i = 0; i < numOfThreads; i++) {
            clients[i] = new ClientFlow(i);
            threads[i] = new Thread(clients[i]);
            threads[i].start();
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        try {
            for (int i = 0; i < numOfThreads; i++) {
                if (threads[i].isAlive())
                threads[i].join();
            }
        } catch (Exception e) {
            exceptionThrow = true;
            System.out.println("err: thread didn't finish?");
            e.printStackTrace();
        }
        double elapsedTime = Math.round((System.nanoTime() - startTime)/1000000000 *100)/100;
        System.out.println("All clients have been serviced!");
        System.out.println("Error thrown by any of the threads: " + exceptionThrow);
        System.out.println("Total execution time taken: " + elapsedTime);
        System.out.println("Clients serviced: " + effectiveThreads);
        System.out.println("Service time per client: " + (Math.round(elapsedTime/((double)effectiveThreads.get())*100)/100));
    }
}