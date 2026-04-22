#!/usr/bin/env sh
# Source me: `. ./scripts/setup-env.sh`
# Exports the Android + JDK env vars the rest of the scripts and `expo` rely on.
# Idempotent — safe to source repeatedly.

# JDK — use the JetBrains Runtime shipped with Android Studio snap (OpenJDK 21).
if [ -d "/snap/android-studio/current/jbr" ]; then
  export JAVA_HOME="/snap/android-studio/current/jbr"
fi

# Android SDK (no-sudo install layout used in BUILDING.md).
if [ -d "$HOME/Android/Sdk" ]; then
  export ANDROID_HOME="$HOME/Android/Sdk"
  export ANDROID_SDK_ROOT="$ANDROID_HOME"
fi

# PATH — prepend so these win over any distro-packaged duplicates.
case ":$PATH:" in
  *":$JAVA_HOME/bin:"*) ;;
  *) [ -n "$JAVA_HOME" ] && export PATH="$JAVA_HOME/bin:$PATH" ;;
esac
for p in \
  "$ANDROID_HOME/cmdline-tools/latest/bin" \
  "$ANDROID_HOME/platform-tools" \
  "$ANDROID_HOME/emulator" \
  "$ANDROID_HOME/build-tools/35.0.0"; do
  [ -d "$p" ] || continue
  case ":$PATH:" in
    *":$p:"*) ;;
    *) export PATH="$p:$PATH" ;;
  esac
done

echo "JAVA_HOME=${JAVA_HOME:-not set}"
echo "ANDROID_HOME=${ANDROID_HOME:-not set}"
