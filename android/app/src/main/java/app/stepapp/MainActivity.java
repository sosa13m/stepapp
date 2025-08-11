package app.stepapp;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private static final int REQ_CODE_CAMERA = 1001;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
          != PackageManager.PERMISSION_GRANTED) {
        ActivityCompat.requestPermissions(this,
          new String[]{ Manifest.permission.CAMERA }, REQ_CODE_CAMERA);
      }
    }

    getBridge().getWebView().setWebChromeClient(new WebChromeClient() {
      @Override
      public void onPermissionRequest(final PermissionRequest request) {
        runOnUiThread(() -> request.grant(request.getResources()));
      }
    });
  }
}
