// import { Pressable, StyleSheet, Text, View } from "react-native";
// import { router, useLocalSearchParams } from "expo-router";
// import * as ImagePicker from "expo-image-picker";

// export default function ScanFood() {
//   const { meal, date } = useLocalSearchParams();

//   const selectedMeal = typeof meal === "string" ? meal : "Breakfast";

//   const selectedDate = typeof date === "string" ? date : "";

//   // =====================================================
//   // TAKE PHOTO
//   // =====================================================

//   const takePhoto = async () => {
//     try {
//       const permission = await ImagePicker.requestCameraPermissionsAsync();

//       if (!permission.granted) {
//         alert("Camera permission is required to scan food.");
//         return;
//       }

//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ["images"],
//         allowsEditing: false,
//         quality: 0.8,
//       });

//       if (result.canceled) {
//         return;
//       }

//       const image = result.assets[0];

//       console.log("Captured food image:", image.uri);

//       router.push({
//         pathname: "/food-detected",

//         params: {
//           meal: selectedMeal,
//           date: selectedDate,
//           imageUri: image.uri,
//         },
//       });
//     } catch (error) {
//       console.error("Could not open camera:", error);

//       alert("Could not open the camera.");
//     }
//   };

//   // =====================================================
//   // CHOOSE FROM GALLERY
//   // =====================================================

//   const chooseFromGallery = async () => {
//     try {
//       console.log("Gallery button pressed");

//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ["images"],
//         allowsEditing: false,
//         quality: 0.8,
//       });

//       console.log("Image picker result:", result);

//       if (result.canceled) {
//         console.log("Image selection cancelled.");
//         return;
//       }

//       const image = result.assets[0];

//       console.log("Selected food image:", image.uri);

//       router.push({
//         pathname: "/food-detected",
//         params: {
//           meal: selectedMeal,
//           date: selectedDate,
//           imageUri: image.uri,
//         },
//       });
//     } catch (error) {
//       console.error("Could not open gallery:", error);
//       alert("Could not open the photo picker.");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Temporary camera background */}
//       <View style={styles.camera}>
//         {/* Header */}

//         <View style={styles.header}>
//           <Pressable style={styles.headerButton} onPress={() => router.back()}>
//             <Text style={styles.headerIcon}>‹</Text>
//           </Pressable>

//           <Text style={styles.title}>Scan Food</Text>

//           {/* Flash is visual-only for now */}

//           <Pressable style={styles.headerButton}>
//             <Text style={styles.flash}>ϟ</Text>
//           </Pressable>
//         </View>

//         {/* Camera center */}

//         <View style={styles.cameraCenter}>
//           <Text style={styles.instruction}>Point your camera at your food</Text>

//           <View style={styles.scanFrame}>
//             <View style={[styles.corner, styles.topLeft]} />

//             <View style={[styles.corner, styles.topRight]} />

//             <View style={[styles.corner, styles.bottomLeft]} />

//             <View style={[styles.corner, styles.bottomRight]} />

//             <Text style={styles.foodPreview}>🍽️</Text>
//           </View>

//           <Text style={styles.hint}>Make sure the food is clearly visible</Text>
//         </View>

//         {/* Camera controls */}

//         <View style={styles.controls}>
//           <View style={styles.controlSpacer} />

//           {/* Take photo */}

//           <Pressable style={styles.captureOuter} onPress={takePhoto}>
//             <View style={styles.captureInner} />
//           </Pressable>

//           {/* Gallery */}

//           <Pressable style={styles.galleryButton} onPress={chooseFromGallery}>
//             <Text style={styles.galleryIcon}>▧</Text>
//           </Pressable>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#151515",
//   },

//   camera: {
//     flex: 1,
//     width: "100%",
//     maxWidth: 430,
//     alignSelf: "center",
//     backgroundColor: "#272727",
//   },

//   header: {
//     paddingHorizontal: 20,
//     paddingTop: 24,

//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },

//   headerButton: {
//     width: 42,
//     height: 42,

//     borderRadius: 14,

//     backgroundColor: "rgba(0,0,0,0.35)",

//     alignItems: "center",
//     justifyContent: "center",
//   },

//   headerIcon: {
//     fontSize: 32,
//     lineHeight: 32,
//     color: "#FFFFFF",
//   },

//   flash: {
//     fontSize: 24,
//     color: "#FFFFFF",
//   },

//   title: {
//     fontSize: 19,
//     fontWeight: "800",
//     color: "#FFFFFF",
//   },

//   cameraCenter: {
//     flex: 1,

//     alignItems: "center",
//     justifyContent: "center",

//     paddingHorizontal: 28,
//   },

//   instruction: {
//     marginBottom: 22,

//     fontSize: 15,
//     fontWeight: "700",
//     color: "#FFFFFF",

//     textAlign: "center",
//   },

//   scanFrame: {
//     width: "100%",
//     aspectRatio: 1,

//     alignItems: "center",
//     justifyContent: "center",
//   },

//   foodPreview: {
//     fontSize: 80,
//     opacity: 0.35,
//   },

//   corner: {
//     position: "absolute",

//     width: 48,
//     height: 48,

//     borderColor: "#97FF79",
//   },

//   topLeft: {
//     top: 0,
//     left: 0,

//     borderTopWidth: 4,
//     borderLeftWidth: 4,

//     borderTopLeftRadius: 18,
//   },

//   topRight: {
//     top: 0,
//     right: 0,

//     borderTopWidth: 4,
//     borderRightWidth: 4,

//     borderTopRightRadius: 18,
//   },

//   bottomLeft: {
//     bottom: 0,
//     left: 0,

//     borderBottomWidth: 4,
//     borderLeftWidth: 4,

//     borderBottomLeftRadius: 18,
//   },

//   bottomRight: {
//     bottom: 0,
//     right: 0,

//     borderBottomWidth: 4,
//     borderRightWidth: 4,

//     borderBottomRightRadius: 18,
//   },

//   hint: {
//     marginTop: 20,

//     fontSize: 12,
//     color: "#C7C7C7",

//     textAlign: "center",
//   },

//   controls: {
//     paddingHorizontal: 34,
//     paddingBottom: 36,

//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },

//   controlSpacer: {
//     width: 50,
//   },

//   captureOuter: {
//     width: 76,
//     height: 76,

//     borderRadius: 38,

//     borderWidth: 4,
//     borderColor: "#FFFFFF",

//     alignItems: "center",
//     justifyContent: "center",
//   },

//   captureInner: {
//     width: 60,
//     height: 60,

//     borderRadius: 30,

//     backgroundColor: "#FFFFFF",
//   },

//   galleryButton: {
//     width: 50,
//     height: 50,

//     borderRadius: 15,

//     backgroundColor: "rgba(0,0,0,0.35)",

//     alignItems: "center",
//     justifyContent: "center",
//   },

//   galleryIcon: {
//     fontSize: 25,
//     color: "#FFFFFF",
//   },
// });

import { Pressable, StyleSheet, Text, View } from "react-native";

import { router } from "expo-router";

export default function ScanFood() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.title}>AI Food Camera</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* WIP Content */}
        <View style={styles.center}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>📷</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>WORK IN PROGRESS</Text>
          </View>

          <Text style={styles.heading}>AI Food Scanning</Text>

          <Text style={styles.description}>
            Take a photo of your meal and Fitness Gurt will identify the food
            and estimate its serving size.
          </Text>

          <Text style={styles.comingSoon}>Coming in a future update!</Text>
        </View>

        {/* Back Button */}
        <Pressable style={styles.doneButton} onPress={() => router.back()}>
          <Text style={styles.doneButtonText}>Got it</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF7",
  },

  content: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",

    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 34,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },

  back: {
    fontSize: 34,
    lineHeight: 34,
    color: "#151515",
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#151515",
  },

  headerSpacer: {
    width: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 18,
  },

  iconBox: {
    width: 110,
    height: 110,

    borderRadius: 30,

    backgroundColor: "#EEFFE8",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 22,
  },

  icon: {
    fontSize: 54,
  },

  badge: {
    paddingHorizontal: 13,
    paddingVertical: 7,

    borderRadius: 20,

    backgroundColor: "#EEFFE8",

    marginBottom: 14,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#397A2C",
    letterSpacing: 0.5,
  },

  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#151515",

    textAlign: "center",
  },

  description: {
    marginTop: 12,

    maxWidth: 310,

    fontSize: 14,
    lineHeight: 21,
    color: "#707070",

    textAlign: "center",
  },

  comingSoon: {
    marginTop: 18,

    fontSize: 13,
    fontWeight: "700",
    color: "#151515",

    textAlign: "center",
  },

  doneButton: {
    height: 52,

    borderRadius: 16,

    backgroundColor: "#97FF79",

    alignItems: "center",
    justifyContent: "center",
  },

  doneButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#151515",
  },
});
