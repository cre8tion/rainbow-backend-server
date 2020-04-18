package test.stress;

import java.io.IOException;
import java.util.Random;

import org.json.JSONException;
import org.json.JSONObject;

public class ClientFlow implements Runnable{
    public int threadNo;
    public String selectedAgent;

    ClientFlow(int i) {
        threadNo = i;
    }

    public void generateGuestAccount() throws JSONException, IOException {
        JSONObject json = HttpRequest.request("GET","/api/v1/guest_creation");
        assert((boolean) json.get("success") == true);
    }

    public String randRouteFilters() {
        String[] r = {"english", "chinese", "malay", "insurance", "bank_statement", "fraud"};
        Random rng = new Random();
        int length = rng.nextInt(6);
        String[] routeArray = new String[length+1];

        for (int i = 0; i < length+1; i++) {
            routeArray[i] = r[rng.nextInt(6)];
        }
        return String.join("+",routeArray);
    }

    public int callRoutingEngine(String routeFilters) throws JSONException, IOException {
        JSONObject json = HttpRequest.request("GET","/db/route/" + routeFilters);
        assert((boolean)json.get("success") == true);
        try {
            JSONObject data = (JSONObject) ((JSONObject)json.get("data"));
            if (data.has("selectedAgent")) {
                selectedAgent = (String) data.get("selectedAgent");
            }
            int status = (int) data.get("status");
            return status;
        } catch(Exception e) {
            e.printStackTrace();
            return -1;
        }
    }

    public void changeAvailability(String selectedAgent) throws IOException {
        JSONObject json = HttpRequest.request("PUT","/db/agent/fake_rainbow_id1/availability/1");
        assert((boolean) json.get("success") == true);
    }

    public void run() {
        try {
            generateGuestAccount();
            String routeFilters = "english";
            System.out.println("Client " + threadNo + " has filters: " + routeFilters);
            int status = callRoutingEngine(routeFilters);
            if (status == 0) {
                System.out.println("Thread " + threadNo + " does not have any agents with available skillsets online. Try another time.");
                MainTest.effectiveThreads.decrementAndGet();
            } else {
                while (status != 1) {
                    System.out.println("Client " + threadNo + " is waiting for a suitable agent to be available");
                    Thread.sleep(1000);
                    status = callRoutingEngine(routeFilters);
                }
                System.out.println("Agent " + selectedAgent + " service request from client " + threadNo + " for 2 seconds");
                Thread.sleep(5000);
                changeAvailability(selectedAgent);
            }
        } catch (Exception e) {
            MainTest.exceptionThrow = true;
            System.out.println("err: thread " + threadNo);
            e.printStackTrace();
        }
    }
}