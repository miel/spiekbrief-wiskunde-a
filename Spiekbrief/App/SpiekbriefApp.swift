import SwiftData
import SwiftUI

@main
struct SpiekbriefApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    private let content = ContentStore.load()

    init() {
        FormulaRenderer.shared.warmUpFont()
    }

    var body: some Scene {
        WindowGroup {
            RootTabView()
                .environment(\.content, content)
        }
        .modelContainer(for: [Favorite.self, CardProgress.self])
    }
}

/// The app is portrait-only, except for views that opt in with `.allowsLandscape()`
/// (the zoomable formula view and the graphs).
final class AppDelegate: NSObject, UIApplicationDelegate {
    @MainActor static var landscapeRequests = 0

    func application(_ application: UIApplication, supportedInterfaceOrientationsFor window: UIWindow?) -> UIInterfaceOrientationMask {
        Self.landscapeRequests > 0 ? .allButUpsideDown : .portrait
    }
}

private struct AllowsLandscape: ViewModifier {
    func body(content: Content) -> some View {
        content
            .onAppear {
                AppDelegate.landscapeRequests += 1
                updateOrientations()
            }
            .onDisappear {
                AppDelegate.landscapeRequests -= 1
                if AppDelegate.landscapeRequests == 0 {
                    rotateToPortrait()
                }
                updateOrientations()
            }
    }

    private func windowScene() -> UIWindowScene? {
        UIApplication.shared.connectedScenes.first { $0.activationState == .foregroundActive } as? UIWindowScene
    }

    private func updateOrientations() {
        windowScene()?.keyWindow?.rootViewController?.setNeedsUpdateOfSupportedInterfaceOrientations()
    }

    private func rotateToPortrait() {
        windowScene()?.requestGeometryUpdate(.iOS(interfaceOrientations: .portrait))
    }
}

extension View {
    /// Lets the device rotate to landscape while this view is on screen.
    func allowsLandscape() -> some View { modifier(AllowsLandscape()) }
}
