import SwiftUI

struct AboutView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text("Spiekbrief voor het eindexamen wiskunde A vwo (centraal examen 2027), plus de statistiek en kansrekening uit het schoolexamen.")
                }
                Section("Wat betekenen de labels?") {
                    ForEach(Badge.allCases, id: \.self) { badge in
                        VStack(alignment: .leading, spacing: 4) {
                            BadgeLabel(badge: badge)
                            Text(badge.explanation)
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.vertical, 2)
                    }
                }
                Section("Bronnen") {
                    Link(destination: URL(string: "https://www.examenblad.nl/system/files/exam-document/2025-07/syllabus-wiskunde-a_vwo-2027_versie-2.pdf")!) {
                        Label("Syllabus wiskunde A vwo 2027, versie 2 (CvTE)", systemImage: "doc.richtext")
                    }
                    Link(destination: URL(string: "https://www.examenblad.nl/system/files/2014/examenprogramma_wiskunde_a_vwo.pdf")!) {
                        Label("Examenprogramma wiskunde A vwo", systemImage: "doc.richtext")
                    }
                    Text("De formulelijst, begrippen en specificaties komen uit de syllabus. © 2025 College voor Toetsen en Examens, overgenomen met bronvermelding.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                Section("Let op") {
                    Text("Deze app is een hulpmiddel om te leren en is niet toegestaan tijdens het examen. Controleer bij je docent welke SE-stof (domein E) bij jouw school hoort. Kijk in september op Examenblad.nl voor wijzigingen.")
                        .font(.footnote)
                }
                Section("Techniek") {
                    Text("Formules worden gezet met SwiftMath (Latin Modern Math). Rekenmachinetips gelden voor de NumWorks in de NL examenstand.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Over Spiekbrief")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) { Button("Klaar") { dismiss() } }
            }
        }
    }
}

extension Badge {
    var explanation: String {
        switch self {
        case .formulelijst: "Staat op de formulelijst (bladzijde 2 van het examen). Wel begrijpen, niet uit je hoofd leren."
        case .paraat: "Staat niet op de formulelijst: dit moet je uit je hoofd kennen. Oefen deze met de kaarten."
        case .se: "Hoort bij het schoolexamen, niet bij het centraal examen."
        case .extra: "Handig om te weten, maar niet vereist volgens de syllabus."
        }
    }
}
