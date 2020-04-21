package test.stress;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import org.json.JSONObject;

public class HttpRequest {
  // public static JSONObject request(String requestMethod, String urlString, String jsonInput)
  public static JSONObject request(String requestMethod, String urlAddon)
      throws IOException {
    // String urlString = "http://localhost:3000" + urlAddon;
    String urlString = "https://sheltered-journey-07706.herokuapp.com" + urlAddon;
    URL url = new URL(urlString);
    HttpURLConnection con = (HttpURLConnection) url.openConnection();
    con.setRequestMethod(requestMethod);
    con.setRequestProperty("Content-Type", "application/json; utf-8");
    con.setRequestProperty("Accept", "application/json");
    // con.setDoOutput(true);
    
    // try(OutputStream os = con.getOutputStream()) {
    //   byte[] input = jsonInput.getBytes("utf-8");
    //   os.write(input, 0, input.length);
    // }

    try(BufferedReader br = new BufferedReader(
      new InputStreamReader(con.getInputStream(), "utf-8"))) {
        StringBuilder res = new StringBuilder();
        String resLine = null;
        while ((resLine = br.readLine()) != null) {
          res.append(resLine.trim());
        }
        JSONObject resJson = new JSONObject(res.toString());
        // System.out.println(resJson.toString(4));
        return resJson;
      }
  }

  public static void main(String[] args) {
    try {
      request("PUT", "/db/agent/fake_rainbow_id1/availability/1");
    } catch (Exception e) {
      e.printStackTrace();
    }
  }














  // private static String readAll(Reader rd) throws IOException {
  //   StringBuilder sb = new StringBuilder();
  //   int cp;
  //   while ((cp = rd.read()) != -1) {
  //     sb.append((char) cp);
  //   }
  //   return sb.toString();
  // }

  // public static JSONObject readJsonFromUrl(String url) throws IOException, JSONException {
  //   InputStream is = new URL(url).openStream();
  //   try {
  //     BufferedReader rd = new BufferedReader(new InputStreamReader(is, Charset.forName("UTF-8")));
  //     String jsonText = readAll(rd);
  //     JSONObject json = new JSONObject(jsonText);
  //     return json;
  //   } finally {
  //     is.close();
  //   }
  // }

  // public static void main(String[] args) throws IOException, JSONException {
  //   JSONObject json = readJsonFromUrl("https://sheltered-journey-07706.herokuapp.com/db/all");
  //   System.out.println(json.toString(4));
  //   System.out.println(json.get("id"));
  // }
}